import { Pool } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { cccd, hoten, ngaysinh } = req.query;

  if (!cccd && !hoten && !ngaysinh) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập thông tin!" });
  }

  try {
    // Sử dụng công cụ Pool chuẩn của Neon để thay thế cho hàm sql cũ
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

    let query = 'SELECT * FROM ChungChi WHERE 1=1';
    let values = [];
    let count = 1;

    if (cccd) {
      query += ` AND "CCCD" = $${count}`;
      values.push(cccd);
      count++;
    }
    if (hoten) {
      query += ` AND "HoTen" ILIKE $${count}`; 
      values.push(`%${hoten}%`);
      count++;
    }
    if (ngaysinh) {
      query += ` AND "NgaySinh" = $${count}`;
      values.push(ngaysinh);
      count++;
    }

    // Thực thi truy vấn bằng Pool
    const result = await pool.query(query, values);

    // Dữ liệu trả về của Pool nằm ở biến rows
    if (result.rows.length > 0) {
      return res.status(200).json({ success: true, data: result.rows });
    } else {
      return res.status(404).json({ success: false, message: "Không tìm thấy dữ liệu văn bằng/chứng chỉ!" });
    }
  } catch (error) {
    console.error("Lỗi Database:", error);
    return res.status(500).json({ success: false, message: "Lỗi kết nối máy chủ dữ liệu!" });
  }
}