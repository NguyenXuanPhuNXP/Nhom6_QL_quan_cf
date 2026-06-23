# TODO: Quản lý phân ca - Thêm tính năng thêm/sửa/xóa ca làm việc

## Status: ✅ ĐÃ HOÀN THÀNH

### Đã thực hiện:
1. **Backend - scheduleController.js**: ✅
   - Thêm functions: createShift, updateShift, deleteShift

2. **Backend - scheduleRoutes.js**: ✅
   - Thêm routes CRUD cho /api/shifts

3. **Frontend - SchedulePage.jsx**: ✅
   - Thêm nút "Thêm ca" trong phần Chú thích ca làm
   - Thêm form tạo/sửa ca (tên ca, giờ bắt đầu, giờ kết thúc, hệ số lương)
   - Thêm chức năng xóa ca (chỉ xóa được ca chưa được phân công)
   - Hiển thị 3 ca mặc định: Ca sáng (6-11h), Ca trưa (11-16h), Ca chiều (16-22h)
