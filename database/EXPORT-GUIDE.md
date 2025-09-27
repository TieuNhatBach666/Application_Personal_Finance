# Xuất dữ liệu từ SQL Server Management Studio (SSMS) để chia sẻ trên GitHub

Hướng dẫn này giải thích cách xuất schema và dữ liệu database từ SQL Server Management Studio (SSMS) để chia sẻ trên GitHub.

## Mục lục
1. [Xuất schema database không có dữ liệu](#xuất-schema-database-không-có-dữ-liệu)
2. [Xuất database cùng với dữ liệu](#xuất-database-cùng-với-dữ-liệu)
3. [Xuất các bảng cụ thể cùng dữ liệu](#xuất-các-bảng-cụ-thể-cùng-dữ-liệu)
4. [Thực hành tốt khi chia sẻ trên GitHub](#thực-hành-tốt-khi-chia-sẻ-trên-github)

## Xuất schema database không có dữ liệu

Nếu bạn chỉ cần chia sẻ cấu trúc database mà không có dữ liệu thực:

1. Mở SQL Server Management Studio (SSMS)
2. Kết nối đến server của bạn (`TIEUNHATBACH\TIEUNHATBACH`)
3. Click chuột phải vào database `PersonalFinanceDB`
4. Chọn **Tasks** → **Generate Scripts...**
5. Trong Wizard:
   - Click **Next** ở trang Introduction
   - Chọn **"Script entire database and all database objects"** → **Next**
   - Chọn **"Save to file"** và chọn vị trí lưu (ví dụ: `database/export-schema.sql`) → **Next**
6. Ở trang **Advanced**:
   - Đặt **"Script Data"** thành **False**
   - Đặt **"Script Indexes"** thành **True**
   - Đặt **"Script Foreign Keys"** thành **True**
   - Đặt **"Script Triggers"** thành **True**
   - Click **Next**
7. Kiểm tra lại các lựa chọn và click **Next**
8. Click **Finish** để tạo script

> ✅ **Lưu ý**: Project này có 2 file SQL chính để chia sẻ:
> - `database/create-database.sql`: Cấu trúc cơ bản với dữ liệu mẫu
> - `database/complete-database-export.sql`: **KHUYẾN NGHỊ** - File hoàn chỉnh bao gồm tất cả fixes, stored procedures, functions và views. Người khác chỉ cần chạy file này là có thể sử dụng ngay mà không gặp lỗi.

## Xuất database cùng với dữ liệu

Để xuất cả schema và dữ liệu (hữu ích để tạo bản sao lưu hoàn chỉnh):

1. Mở SQL Server Management Studio (SSMS)
2. Kết nối đến server của bạn (`TIEUNHATBACH\TIEUNHATBACH`)
3. Click chuột phải vào database `PersonalFinanceDB`
4. Chọn **Tasks** → **Generate Scripts...**
5. Trong Wizard:
   - Click **Next** ở trang Introduction
   - Chọn **"Script entire database and all database objects"** → **Next**
   - Chọn **"Save to file"** và chọn vị trí lưu (ví dụ: `database/export-full.sql`) → **Next**
6. Ở trang **Advanced**:
   - Đặt **"Script Data"** thành **True**
   - Đặt **"Script Indexes"** thành **True**
   - Đặt **"Script Foreign Keys"** thành **True**
   - Đặt **"Script Triggers"** thành **True**
   - Đặt **"Types of data to script"** thành **"Data only"** nếu chỉ muốn dữ liệu, hoặc **"Schema and data"** cho cả hai
   - Click **Next**
7. Kiểm tra lại các lựa chọn và click **Next**
8. Click **Finish** để tạo script

> ⚠️ **Cảnh báo**: Xuất dữ liệu có thể bao gồm thông tin nhạy cảm như mật khẩu người dùng. Luôn kiểm tra file đã xuất trước khi chia sẻ công khai.

## Xuất các bảng cụ thể cùng dữ liệu

Để xuất chỉ các bảng cụ thể cùng dữ liệu của chúng:

1. Mở SQL Server Management Studio (SSMS)
2. Kết nối đến server của bạn (`TIEUNHATBACH\TIEUNHATBACH`)
3. Click chuột phải vào database `PersonalFinanceDB`
4. Chọn **Tasks** → **Generate Scripts...**
5. Trong Wizard:
   - Click **Next** ở trang Introduction
   - Chọn **"Select specific database objects"**
   - Đánh dấu chọn các bảng bạn muốn xuất → **Next**
   - Chọn **"Save to file"** và chọn vị trí lưu → **Next**
6. Ở trang **Advanced**:
   - Đặt **"Script Data"** thành **True**
   - Đặt các tùy chọn khác theo nhu cầu → **Next**
7. Kiểm tra lại các lựa chọn và click **Next**
8. Click **Finish** để tạo script

## Thực hành tốt khi chia sẻ trên GitHub

1. **Sử dụng file mẫu có sẵn**: Project này đã bao gồm file `create-database.sql` chứa cả schema và dữ liệu mẫu. Đây là file được khuyến nghị để chia sẻ với người khác, vì nó:
   - Sử dụng cấu trúc database đúng với API backend
   - Bao gồm dữ liệu mẫu để test
   - Chứa user test với thông tin đăng nhập đã biết
   - Có thể sử dụng ngay mà không cần setup thêm

2. **Xóa dữ liệu nhạy cảm**: Nếu bạn xuất database của mình, hãy chắc chắn xóa hoặc ẩn danh thông tin nhạy cảm:
   ```sql
   -- Ví dụ: Xóa tất cả dữ liệu người dùng trừ categories mặc định
   DELETE FROM Users;
   DELETE FROM Transactions;
   DELETE FROM Budgets;
   DELETE FROM UserSettings;
   DELETE FROM Notifications;
   ```

3. **Tài liệu hóa việc xuất dữ liệu**: Bao gồm file README giải thích nội dung của file đã xuất và cách sử dụng:
   ```markdown
   # Xuất dữ liệu Database
   - `create-database.sql`: Database hoàn chỉnh với schema và dữ liệu mẫu
   ```

4. **Quản lý phiên bản**: Commit các file đã xuất vào Git với message mô tả:
   ```bash
   git add database/create-database.sql
   git commit -m "Cập nhật xuất database với dữ liệu mẫu cho phiên bản 1.0"
   git push origin main
   ```

5. **Cập nhật tài liệu**: Đảm bảo cập nhật bất kỳ tài liệu nào liên quan để phản ánh các file xuất mới.

## Khắc phục sự cố

### Các vấn đề thường gặp:

1. **File quá lớn**: Nếu file xuất quá lớn cho GitHub (trên 100MB), hãy cân nhắc:
   - Chỉ xuất dữ liệu cần thiết
   - Nén file (định dạng ZIP)
   - Sử dụng Git LFS cho file lớn

2. **Lỗi xuất dữ liệu**: Nếu gặp lỗi khi xuất:
   - Kiểm tra quyền truy cập database
   - Đảm bảo dịch vụ SQL Server đang chạy
   - Thử xuất subset dữ liệu nhỏ hơn

3. **Lỗi nhập dữ liệu**: Nếu người khác gặp vấn đề khi nhập file đã xuất:
   - Ghi rõ phiên bản SQL Server đã dùng
   - Tài liệu hóa các phụ thuộc hoặc điều kiện tiên quyết
   - Test quá trình nhập trên database sạch

## Tài nguyên bổ sung

- [Tài liệu Microsoft về Generate Scripts Wizard](https://docs.microsoft.com/en-us/sql/ssms/scripting/generate-scripts-sql-server-management-studio)
- [Sao lưu và phục hồi SQL Server](https://docs.microsoft.com/en-us/sql/relational-databases/backup-restore/back-up-and-restore-of-sql-server-databases)