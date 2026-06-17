import { Pool } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const { cccd, hoten, ngaysinh } = req.query;

  if (!cccd && !hoten && !ngaysinh) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập thông tin!" });
  }

  // Mở cổng kết nối
  const pool = new Pool({ connectionString: process.env.POSTGRES_URL });

  try {
    let query = 'SELECT * FROM chungchi WHERE 1=1';
    let values = [];
    let count = 1;

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
      query += ` AND ngaysinh::date = $${count}::date`;
      values.push(ngaysinh);
      count++;
    }

    // Thực thi lấy dữ liệu
    const result = await pool.query(query, values);

    // QUAN TRỌNG: Phải đóng cổng kết nối để Vercel không bị treo!
    await pool.end();

    // Trả kết quả về cho Angular
    if (result.rows.length > 0) {
      return res.status(200).json({ success: true, data: result.rows });
    } else {
      return res.status(404).json({ success: false, message: "Không tìm thấy dữ liệu văn bằng/chứng chỉ!" });
    }

  } catch (error) {
    console.error("Lỗi Database:", error);
    // Dù có lỗi ngầm xảy ra cũng bắt buộc phải đóng cổng kết nối
    await pool.end();
    return res.status(500).json({ success: false, message: "Lỗi kết nối máy chủ dữ liệu!" });
  }
}