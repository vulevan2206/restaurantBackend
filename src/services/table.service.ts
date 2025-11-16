import { STATUS } from '~/constants/httpStatus'
import { tableStatus } from '~/enums/tableStatus.enum'
import { TableModel, TableSessionModel } from '~/models'
import { ErrorHandler } from '~/utils/response'

const addTable = async (table: TableRequest) => {
  try {
    const { table_number } = table
    const existTable = await TableModel.findOne({ table_number })
    if (!existTable) {
      const newTable = await TableModel.create(table)
      const response = {
        message: 'Tạo bàn thành công',
        data: newTable
      }
      return response
    }
    throw new ErrorHandler(STATUS.NOT_ACCEPTABLE, 'Bàn đã tồn tại')
  } catch (error) {
    console.log(error)
    throw error
  }
}

const leaveTable = async (table_number: number) => {
  try {
    await TableModel.findOneAndUpdate(
      {
        table_number
      },
      { $inc: { current: -1 } }
    )
    const response = {
      message: 'Rời bàn thành công'
    }
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

const checkAvailableTable = async (table_number: number, token: string) => {
  try {
    const existTable = await TableModel.findOne({
      table_number,
      token
    }).lean()
    if (!existTable) {
      throw new ErrorHandler(STATUS.NOT_FOUND, 'Bàn không tồn tại')
    }
    if (existTable.current === existTable.capacity) {
      throw new ErrorHandler(STATUS.NOT_ACCEPTABLE, 'Bàn hiện tại đã đầy')
    }
    if (existTable.status === tableStatus.BOOKED) {
      throw new ErrorHandler(STATUS.NOT_ACCEPTABLE, 'Bàn đã được đặt trước')
    }
    await TableModel.findOneAndUpdate(
      {
        table_number,
        token
      },
      {
        $inc: { current: 1 }
      },
      {
        new: true
      }
    )
    const response = {
      message: 'Đăng nhập bàn thành công'
    }
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

const getAllTables = async (query: TableQuery) => {
  try {
    // eslint-disable-next-line prefer-const
    let { page = '1', limit = '8', table_number } = query
    page = Number(page)
    limit = Number(limit)

    const condition: any = {}
    if (table_number) {
      condition.table_number = Number(table_number)
    }

    const totalTables = await TableModel.countDocuments(condition)

    const tables = await TableModel.find(condition)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const totalPages = Math.ceil(totalTables / limit)

    const response = {
      message: 'Lấy tất cả bàn ăn thành công',
      data: {
        content: tables,
        pagination: {
          page,
          limit,
          total: totalTables,
          pageSize: totalPages
        }
      }
    }

    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

const updateTable = async (id_table: string, body: TableRequest) => {
  try {
    const { table_number, capacity, status, token } = body
    const existTable = await TableModel.findById(id_table).lean()
    if (!existTable) {
      throw new ErrorHandler(STATUS.NOT_FOUND, 'Bàn không tồn tại')
    }
    if (existTable.table_number !== table_number) {
      const existTableByTableNumber = await TableModel.findOne({
        table_number
      })
      if (existTableByTableNumber) {
        throw new ErrorHandler(STATUS.NOT_ACCEPTABLE, 'Bàn đã tồn tại')
      }
    }
    const updateData: any = {}
    if (table_number) {
      updateData.table_number = table_number
    }
    if (capacity) {
      updateData.capacity = capacity
    }
    if (status) {
      updateData.status = status
    }
    if (token) {
      updateData.token = token
    }
    const updatedData = await TableModel.findByIdAndUpdate(
      id_table,
      {
        $set: updateData
      },
      {
        new: true,
        runValidators: true
      }
    )
    const response = {
      message: 'Cập nhật bàn ăn thành công',
      data: updatedData
    }
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

const deleteTable = async (id_table: string) => {
  try {
    if (!id_table) {
      throw new ErrorHandler(STATUS.NOT_ACCEPTABLE, 'Chưa cung cấp id của bàn')
    }
    const existTable = await TableModel.findById(id_table)
    if (!existTable) {
      throw new ErrorHandler(STATUS.NOT_FOUND, 'Bàn không tồn tại')
    }
    await TableModel.deleteOne({
      _id: id_table
    })
    const response = {
      message: 'Xóa bàn thành công'
    }
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

// Check if table has active session
const checkTableSession = async (table_number: number) => {
  try {
    const activeSession = await TableSessionModel.findOne({
      table_number,
      is_active: true
    }).lean()

    const response = {
      message: activeSession ? 'Bàn đang có người sử dụng' : 'Bàn trống',
      data: {
        hasActiveSession: !!activeSession,
        session: activeSession || null
      }
    }
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

// Create table session when customer logs in
const createTableSession = async (sessionData: TableSessionRequest) => {
  try {
    const { table_number, customer_id, customer_name, token } = sessionData

    // Verify table exists and token is valid
    const existTable = await TableModel.findOne({
      table_number,
      token
    }).lean()

    if (!existTable) {
      throw new ErrorHandler(STATUS.NOT_FOUND, 'Bàn không tồn tại hoặc token không hợp lệ')
    }

    if (existTable.status === tableStatus.BOOKED) {
      throw new ErrorHandler(STATUS.NOT_ACCEPTABLE, 'Bàn đã được đặt trước')
    }

    // Check if table already has active session
    const activeSession = await TableSessionModel.findOne({
      table_number,
      is_active: true
    }).lean()

    if (activeSession) {
      throw new ErrorHandler(
        STATUS.NOT_ACCEPTABLE,
        'Bàn đang có người sử dụng. Vui lòng yêu cầu nhân viên hỗ trợ nếu bạn cần trợ giúp.'
      )
    }

    // Create new session
    const newSession = await TableSessionModel.create({
      table_number,
      customer_id,
      customer_name,
      is_active: true,
      logged_in_at: new Date(),
      last_activity: new Date()
    })

    const response = {
      message: 'Đăng nhập bàn thành công',
      data: newSession
    }
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

// Unlock table session (manual by staff or auto on payment)
const unlockTableSession = async (unlockData: TableSessionUnlockRequest) => {
  try {
    const { table_number, customer_id } = unlockData

    const query: any = {
      table_number,
      is_active: true
    }

    // If customer_id provided, only unlock that specific session
    if (customer_id) {
      query.customer_id = customer_id
    }

    const session = await TableSessionModel.findOne(query)

    if (!session) {
      throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy phiên đang hoạt động')
    }

    session.is_active = false
    session.logged_out_at = new Date()
    await session.save()

    const response = {
      message: 'Mở khóa bàn thành công',
      data: session
    }
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

// Update session activity (heartbeat)
const updateSessionActivity = async (customer_id: string) => {
  try {
    const session = await TableSessionModel.findOneAndUpdate(
      {
        customer_id,
        is_active: true
      },
      {
        last_activity: new Date()
      },
      {
        new: true
      }
    )

    if (!session) {
      throw new ErrorHandler(STATUS.NOT_FOUND, 'Không tìm thấy phiên đang hoạt động')
    }

    const response = {
      message: 'Cập nhật hoạt động thành công',
      data: session
    }
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}

export default {
  addTable,
  checkAvailableTable,
  getAllTables,
  updateTable,
  deleteTable,
  leaveTable,
  checkTableSession,
  createTableSession,
  unlockTableSession,
  updateSessionActivity
}
