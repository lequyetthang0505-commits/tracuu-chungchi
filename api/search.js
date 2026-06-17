import { Pool } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { cccd, hoten, ngaysinh } = req.query;

  if (!cccd && !hoten && !ngaysinh) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập thông tin!" });
  }

  try {
    const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

    // 1. Tên bảng viết thường: chungchi
    let query = 'SELECT * FROM chungchi WHERE 1=1';
    let values = [];
    let count = 1;

    // 2. Tên cột viết thường
    if (cccd) {
      query += ` AND cccd = $${count}`;
      values.push(cccd);
      count++;
    }
    if (hoten) {
      query += ` AND hoten ILIKE $${count}`; 
      values.push(`%${hoten}%`);
      count++;
    }
    if (ngaysinh) {
      // 3. Ép kiểu ::date để so sánh ngày chuẩn xác với TIMESTAMP của Neon
      query += ` AND ngaysinh::date = $${count}::date`;
      values.push(ngaysinh);
      count++;
    }

    const result = await pool.query(query, values);

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