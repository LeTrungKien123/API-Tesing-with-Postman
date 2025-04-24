const axios = require('axios');
const BASE_URL = 'https://api.dak.edu.vn/api_rau/vegetables.php';
const express = require('express');
const path = require('path');

// Khởi tạo ứng dụng Express
const app = express();
const PORT = 3000;

// Phục vụ các file tĩnh từ thư mục frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Route mặc định để phục vụ file HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'style.html'));
});


async function getVegetables(page = 1, limit = 5) {
    try {
        // Kiểm tra đầu vào
        if (isNaN(page) || page < 1) {
            throw new Error('Số trang phải là số nguyên dương');
        }
        if (isNaN(limit) || limit < 1) {
            throw new Error('Giới hạn mỗi trang phải là số nguyên dương');
        }

        const response = await axios.get(`${BASE_URL}?page=${page}&limit=${limit}`);
        
        console.log(`\nDanh sách rau củ (Trang ${page}/${response.data.pages}) ===`);
        console.log(`Tổng số: ${response.data.total} mục`);
        console.log('----------------------------------------');
        
        response.data.data.forEach(vegetable => {
            console.log('{');
            console.log(`  "id": ${vegetable.id},`);
            console.log(`  "name": "${vegetable.name}",`);
            console.log(`  "scientific_name": "${vegetable.scientific_name || 'Chưa có dữ liệu'}",`);
            console.log(`  "price": ${vegetable.price},`);
            console.log(`  "family": "${vegetable.family || 'Chưa có dữ liệu'}",`);
            console.log(`  "description": "${vegetable.description || 'Chưa có mô tả'}",`);
            console.log(`  "benefits": "${vegetable.benefits || 'Chưa có thông tin'}",`);
            console.log(`  "image": "${vegetable.image || 'Chưa có hình ảnh'}",`);
            console.log(`  "group": "${vegetable.group}"`);
            console.log('}');
            console.log('----------------------------------------');
        });
        
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách rau củ:', error.message);
        throw error;
    }
}


async function addVegetable(vegetableData) {
    try {
        // Kiểm tra đầu vào
        if (!vegetableData.name) {
            throw new Error('Tên rau củ là bắt buộc');
        }
        if (!vegetableData.price || isNaN(vegetableData.price)) {
            throw new Error('Giá phải là số và là bắt buộc');
        }
        if (!vegetableData.description) {
            vegetableData.description = "Không có mô tả";
        }

        const response = await axios.post(BASE_URL, vegetableData);
        
        // Hiển thị phản hồi theo định dạng mong muốn
        console.log('{');
        console.log(`  "success": ${response.data.success},`);
        console.log(`  "message": "${response.data.message}",`);
        console.log('  "data": {');
        console.log(`    "id": ${response.data.data.id},`);
        console.log(`    "name": "${response.data.data.name}",`);
        console.log(`    "price": ${response.data.data.price}`);
        console.log('     }');
        console.log('}');
        
        return response.data;
    } catch (error) {
        console.log('{');
        console.log('  "success": false,');
        console.log(`  "message": "${error.message}"`);
        console.log('}');
        throw error;
    }
}

async function updateVegetable(id, updateData) {
    try {
        // Kiểm tra đầu vào
        if (!id || isNaN(id)) {
            throw new Error('ID rau củ phải là số và là bắt buộc');
        }
        if (!updateData.price && !updateData.description) {
            throw new Error('Cần ít nhất một trường (price hoặc description) để cập nhật');
        }
        if (updateData.price && isNaN(updateData.price)) {
            throw new Error('Giá phải là số');
        }

        console.log(JSON.stringify(updateData, null, 2));

        const response = await axios.put(`${BASE_URL}?id=${id}`, updateData);
        
        console.log(JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('Lỗi cập nhật');
        console.error(JSON.stringify({
            message: error.response?.data?.message || error.message,
            error: true
        }, null, 2));
        throw error;
    }
}


async function deleteVegetable(id) {
    try {
        // Kiểm tra đầu vào
        if (!id || isNaN(id)) {
            throw new Error('ID rau củ phải là số và là bắt buộc');
        }

        // Gửi request xóa
        const response = await axios.delete(`${BASE_URL}?id=${id}`);

        // Tạo phản hồi theo định dạng mong muốn
        const result = {
            message: response.data.message || "Xóa rau thành công"
        };

        // Hiển thị kết quả
        console.log(JSON.stringify(result, null, 2));
        
        return result;
    } catch (error) {
        // Xử lý lỗi và hiển thị dưới dạng JSON
        const errorResponse = {
            message: error.response?.data?.message || error.message,
            error: true
        };
        console.error(JSON.stringify(errorResponse, null, 2));
        throw error;
    }
}

// Hàm main để demo các chức năng
async function main() {
    try {
        console.log('Demo ứng dụng quản lí rau củ');
        
        // Demo lấy danh sách
        console.log('\n1. Lấy danh sách rau củ trang 1:');
        await getVegetables(1);
        
        // Demo thêm mới
        console.log('2. Thêm rau củ mới:');
        const newVegetable = {
            name: "Rau xà lách",
            price: 334000,
            group: "Lá",
            description: "Rau xà lách tươi ngon"
        };
        await addVegetable(newVegetable);
        
        try {
            const updateData = {
                price: 18000,
                description: "Rau muống tươi ngon, giàu dinh dưỡng"
            };
            
            console.log('3. Cập nhật rau củ:');
            await updateVegetable(204, updateData);
        } catch (error) {
            console.error('Demo bị lỗi:', error.message);
        }
        

        console.log('4. Xóa rau củ:');
        await deleteVegetable(317);
        
    } catch (error) {
        console.error('Có lỗi xảy ra trong quá trình demo:', error.message);
    }
}

// Gọi hàm main để chạy demo
main();
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log('Demo ứng dụng quản lí rau củ');
    
});