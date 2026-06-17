import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  searchQuery = { cccd: '', hoten: '', ngaysinh: '' };
  
  result: any = null; // Biến lưu duy nhất 1 kết quả tìm được
  isLoading = false;
  searchState: 'idle' | 'found' | 'notfound' = 'idle'; // Trạng thái màn hình hiển thị
  errorMessage = '';

  constructor(private http: HttpClient) {}

  // Hàm chuyển đổi định dạng ngày YYYY-MM-DD sang DD/MM/YYYY
  formatDate(isoDate: string): string {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      if (isNaN(date.getTime())) return isoDate; 
      const d = date.getDate().toString().padStart(2, '0');
      const m = (date.getMonth() + 1).toString().padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    } catch {
      return isoDate;
    }
  }

  onSearch() {
    // Reset lỗi mỗi lần bấm tra cứu
    this.errorMessage = '';
    
    // Validate Front-end (Kiểm tra người dùng đã nhập chưa)
    if (!this.searchQuery.cccd && !(this.searchQuery.hoten && this.searchQuery.ngaysinh)) {
      this.errorMessage = 'Nhập số CCCD, hoặc nhập đủ họ tên và ngày sinh.';
      return;
    }

    // Bật hiệu ứng xoay, đưa màn hình về trạng thái chờ
    this.isLoading = true;
    this.searchState = 'idle';
    this.result = null;

    // Đóng gói dữ liệu gửi đi
    const params = new URLSearchParams();
    if (this.searchQuery.cccd) params.append('cccd', this.searchQuery.cccd);
    if (this.searchQuery.hoten) params.append('hoten', this.searchQuery.hoten);
    if (this.searchQuery.ngaysinh) params.append('ngaysinh', this.searchQuery.ngaysinh);

    // Gọi API sang backend
    this.http.get<any>(`/api/search?${params.toString()}`).subscribe({
      next: (res) => {
        // Lấy kết quả đầu tiên trả về từ mảng PostgreSQL
        if (res.data && res.data.length > 0) {
          this.result = res.data[0];
          this.searchState = 'found';
        } else {
          this.searchState = 'notfound';
          this.errorMessage = 'Thông tin không hợp lệ hoặc không có trong dữ liệu.';
        }
        this.isLoading = false; // Tắt vòng xoay
      },
      error: (err) => {
        // Đón lỗi 404 từ backend trả về
        this.searchState = 'notfound';
        if (err.status === 404) {
          this.errorMessage = 'Thông tin không hợp lệ hoặc không có trong dữ liệu.';
        } else {
          this.errorMessage = err.error?.message || 'Lỗi hệ thống hoặc mất kết nối!';
        }
        this.isLoading = false; // Bắt buộc tắt vòng xoay
      }
    });
  }
}