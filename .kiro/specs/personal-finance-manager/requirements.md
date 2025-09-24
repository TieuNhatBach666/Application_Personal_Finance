# Requirements Document

## Introduction

Ứng dụng Quản lý Tài chính Cá nhân là một hệ thống desktop được xây dựng bằng React với cơ sở dữ liệu SQL Server, giúp người dùng theo dõi thu chi, lập kế hoạch tài chính và đưa ra quyết định tài chính thông minh. Ứng dụng tập trung vào giao diện đẹp mắt, chức năng đầy đủ và sử dụng 100% dữ liệu thật từ database.

## Requirements

### Requirement 1: Hệ thống Đăng nhập và Quản lý Tài khoản

**User Story:** Là một người dùng, tôi muốn có thể đăng ký và đăng nhập vào hệ thống để bảo mật thông tin tài chính cá nhân của mình.

#### Acceptance Criteria

1. WHEN người dùng truy cập ứng dụng lần đầu THEN hệ thống SHALL hiển thị màn hình đăng nhập với logo và form đăng nhập
2. WHEN người dùng nhập email/số điện thoại và mật khẩu hợp lệ THEN hệ thống SHALL xác thực và chuyển đến dashboard chính
3. WHEN người dùng chọn "Đăng ký" THEN hệ thống SHALL hiển thị form đăng ký với các trường bắt buộc
4. WHEN người dùng đăng ký thành công THEN hệ thống SHALL tạo tài khoản mới trong database và gửi thông báo xác nhận
5. WHEN người dùng chọn "Ghi nhớ đăng nhập" THEN hệ thống SHALL lưu session để tự động đăng nhập lần sau
6. WHEN người dùng quên mật khẩu THEN hệ thống SHALL cung cấp chức năng khôi phục mật khẩu

### Requirement 2: Quản lý Thu nhập

**User Story:** Là một người dùng, tôi muốn ghi nhận và quản lý các khoản thu nhập để theo dõi tổng thu nhập của mình.

#### Acceptance Criteria

1. WHEN người dùng chọn "Thêm thu nhập" THEN hệ thống SHALL hiển thị form nhập với các trường: số tiền, ngày tháng, danh mục, ghi chú
2. WHEN người dùng nhập đầy đủ thông tin thu nhập THEN hệ thống SHALL lưu vào database và cập nhật tổng thu nhập
3. WHEN người dùng xem danh sách thu nhập THEN hệ thống SHALL hiển thị tất cả giao dịch thu nhập từ database theo thời gian
4. WHEN người dùng chọn chỉnh sửa thu nhập THEN hệ thống SHALL cho phép cập nhật thông tin và lưu thay đổi vào database
5. WHEN người dùng xóa thu nhập THEN hệ thống SHALL yêu cầu xác nhận và xóa khỏi database
6. WHEN người dùng lọc thu nhập theo thời gian THEN hệ thống SHALL hiển thị kết quả lọc từ database

### Requirement 3: Quản lý Chi tiêu

**User Story:** Là một người dùng, tôi muốn ghi nhận và phân loại các khoản chi tiêu để kiểm soát tài chính cá nhân.

#### Acceptance Criteria

1. WHEN người dùng chọn "Thêm chi tiêu" THEN hệ thống SHALL hiển thị form với các trường: số tiền, danh mục, ngày tháng, ghi chú
2. WHEN người dùng chọn danh mục chi tiêu THEN hệ thống SHALL hiển thị grid các danh mục với icon và màu sắc từ database
3. WHEN người dùng lưu chi tiêu THEN hệ thống SHALL lưu vào database và cập nhật tổng chi tiêu
4. WHEN người dùng xem lịch sử chi tiêu THEN hệ thống SHALL hiển thị danh sách giao dịch từ database với khả năng tìm kiếm
5. WHEN người dùng tìm kiếm giao dịch THEN hệ thống SHALL lọc dữ liệu từ database theo từ khóa hoặc danh mục
6. WHEN người dùng chỉnh sửa/xóa chi tiêu THEN hệ thống SHALL cập nhật hoặc xóa dữ liệu trong database

### Requirement 4: Hệ thống Phân loại và Danh mục

**User Story:** Là một người dùng, tôi muốn tạo và quản lý các danh mục thu chi để phân loại giao dịch một cách có tổ chức.

#### Acceptance Criteria

1. WHEN người dùng vào "Quản lý danh mục" THEN hệ thống SHALL hiển thị danh sách danh mục thu nhập và chi tiêu từ database
2. WHEN người dùng tạo danh mục mới THEN hệ thống SHALL cho phép nhập tên, chọn icon, màu sắc và lưu vào database
3. WHEN người dùng chỉnh sửa danh mục THEN hệ thống SHALL cập nhật thông tin trong database và áp dụng cho giao dịch liên quan
4. WHEN người dùng xóa danh mục THEN hệ thống SHALL kiểm tra giao dịch liên quan và yêu cầu xác nhận trước khi xóa
5. WHEN người dùng chọn danh mục trong giao dịch THEN hệ thống SHALL hiển thị danh mục với icon và màu sắc tương ứng
6. WHEN hệ thống hiển thị danh mục THEN hệ thống SHALL sắp xếp theo thứ tự được định nghĩa trong database

### Requirement 5: Thống kê và Báo cáo

**User Story:** Là một người dùng, tôi muốn xem các biểu đồ thống kê và báo cáo để hiểu rõ tình hình tài chính của mình.

#### Acceptance Criteria

1. WHEN người dùng vào tab "Thống kê" THEN hệ thống SHALL hiển thị biểu đồ tròn, cột, đường từ dữ liệu database
2. WHEN người dùng chọn khoảng thời gian THEN hệ thống SHALL lọc dữ liệu từ database và cập nhật biểu đồ
3. WHEN người dùng xem báo cáo tháng/quý/năm THEN hệ thống SHALL tính toán và hiển thị tổng quan thu chi từ database
4. WHEN người dùng so sánh thu chi THEN hệ thống SHALL hiển thị biểu đồ so sánh giữa các kỳ từ dữ liệu database
5. WHEN người dùng xuất báo cáo THEN hệ thống SHALL tạo file PDF/Excel từ dữ liệu database
6. WHEN người dùng xem chi tiết danh mục THEN hệ thống SHALL hiển thị bảng phân tích chi tiết từ database

### Requirement 6: Quản lý Ngân sách

**User Story:** Là một người dùng, tôi muốn đặt ngân sách cho từng danh mục và theo dõi tiến độ chi tiêu để kiểm soát tài chính.

#### Acceptance Criteria

1. WHEN người dùng tạo ngân sách mới THEN hệ thống SHALL cho phép nhập tổng ngân sách, phân bổ theo danh mục và lưu vào database
2. WHEN người dùng xem tiến độ ngân sách THEN hệ thống SHALL hiển thị progress bar dựa trên dữ liệu chi tiêu thực tế từ database
3. WHEN chi tiêu vượt 70% ngân sách THEN hệ thống SHALL hiển thị cảnh báo màu vàng
4. WHEN chi tiêu vượt 90% ngân sách THEN hệ thống SHALL hiển thị cảnh báo màu đỏ
5. WHEN người dùng điều chỉnh ngân sách THEN hệ thống SHALL cập nhật trong database và tính toán lại tiến độ
6. WHEN tháng mới bắt đầu THEN hệ thống SHALL reset tiến độ ngân sách dựa trên cài đặt trong database

### Requirement 7: Hệ thống Cảnh báo và Gợi ý

**User Story:** Là một người dùng, tôi muốn nhận được cảnh báo và gợi ý để quản lý tài chính hiệu quả hơn.

#### Acceptance Criteria

1. WHEN hệ thống phân tích dữ liệu chi tiêu THEN hệ thống SHALL đưa ra gợi ý tiết kiệm dựa trên xu hướng từ database
2. WHEN người dùng vượt ngân sách THEN hệ thống SHALL hiển thị thông báo cảnh báo trên dashboard
3. WHEN hệ thống phát hiện chi tiêu bất thường THEN hệ thống SHALL gửi cảnh báo cho người dùng
4. WHEN người dùng không ghi chép giao dịch THEN hệ thống SHALL nhắc nhở dựa trên lịch sử hoạt động trong database
5. WHEN cuối tuần THEN hệ thống SHALL tạo báo cáo tình hình tài chính từ dữ liệu database
6. WHEN hệ thống phân tích xu hướng THEN hệ thống SHALL đề xuất tối ưu hóa chi tiêu dựa trên dữ liệu lịch sử

### Requirement 8: Cài đặt Hệ thống

**User Story:** Là một người dùng, tôi muốn tùy chỉnh cài đặt ứng dụng và quản lý dữ liệu cá nhân.

#### Acceptance Criteria

1. WHEN người dùng vào "Cài đặt" THEN hệ thống SHALL hiển thị các tùy chọn cấu hình từ database
2. WHEN người dùng cập nhật thông tin cá nhân THEN hệ thống SHALL lưu thay đổi vào database
3. WHEN người dùng bật/tắt thông báo THEN hệ thống SHALL cập nhật cài đặt trong database
4. WHEN người dùng sao lưu dữ liệu THEN hệ thống SHALL export toàn bộ dữ liệu từ database
5. WHEN người dùng khôi phục dữ liệu THEN hệ thống SHALL import và cập nhật database
6. WHEN người dùng thay đổi mật khẩu THEN hệ thống SHALL mã hóa và cập nhật trong database

### Requirement 9: Giao diện và Trải nghiệm Người dùng

**User Story:** Là một người dùng, tôi muốn có giao diện đẹp mắt, dễ sử dụng và responsive trên desktop.

#### Acceptance Criteria

1. WHEN ứng dụng khởi động THEN hệ thống SHALL hiển thị giao diện với thiết kế hiện đại, màu sắc hài hòa
2. WHEN người dùng resize cửa sổ THEN giao diện SHALL tự động điều chỉnh layout phù hợp
3. WHEN người dùng hover vào các element THEN hệ thống SHALL hiển thị hiệu ứng visual feedback
4. WHEN người dùng thực hiện thao tác THEN hệ thống SHALL có animation mượt mà và loading states
5. WHEN hiển thị dữ liệu THEN hệ thống SHALL sử dụng biểu đồ, icon, màu sắc để trực quan hóa
6. WHEN người dùng sử dụng keyboard THEN hệ thống SHALL hỗ trợ các phím tắt cơ bản

### Requirement 10: Kết nối Database và Hiệu suất

**User Story:** Là một người dùng, tôi muốn ứng dụng kết nối ổn định với SQL Server và xử lý dữ liệu nhanh chóng.

#### Database Connection Information:
- **Server Name:** TIEUNHATBACH\TIEUNHATBACH
- **Login:** sa
- **Password:** 123456
- **Database:** PersonalFinanceDB (sẽ được tạo)

#### Acceptance Criteria

1. WHEN ứng dụng khởi động THEN hệ thống SHALL kết nối thành công với SQL Server (TIEUNHATBACH\TIEUNHATBACH) sử dụng login sa/123456
2. WHEN thực hiện truy vấn database THEN hệ thống SHALL xử lý trong thời gian dưới 2 giây
3. WHEN có lỗi kết nối database THEN hệ thống SHALL hiển thị thông báo lỗi và thử kết nối lại
4. WHEN lưu dữ liệu THEN hệ thống SHALL đảm bảo tính toàn vẹn và consistency của database
5. WHEN tải dữ liệu lớn THEN hệ thống SHALL sử dụng pagination và lazy loading
6. WHEN backup database THEN hệ thống SHALL tạo bản sao lưu đầy đủ và có thể khôi phục