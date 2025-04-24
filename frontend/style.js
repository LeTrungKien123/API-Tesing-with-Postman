const API_URL = 'https://api.dak.edu.vn/api_rau/vegetables.php';

// Lấy và hiển thị rau củ
async function fetchVegetables() {
  try {
    const res = await fetch(`${API_URL}?page=1&limit=20`);
    const data = await res.json();
    renderVegetables(data.data);
  } catch (err) {
    console.error('Lỗi lấy dữ liệu:', err);
  }
}

// Hiển thị danh sách rau củ
function renderVegetables(vegetables) {
  const list = document.getElementById('vegetableList');
  list.innerHTML = '';
  vegetables.forEach(veg => {
    const card = document.createElement('div');
    card.className = 'veg-card';
    card.innerHTML = `
      <h3>${veg.name}</h3>
      <p><strong>Giá:</strong> ${veg.price} VND</p>
      <p><strong>Nhóm:</strong> ${veg.group}</p>
      <p><strong>Mô tả:</strong> ${veg.description || 'Không có mô tả'}</p>
      <div class="card-actions">
        <button class="edit" onclick="editVegetable(${veg.id})">Sửa</button>
        <button class="delete" onclick="deleteVegetable(${veg.id})">Xóa</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// Thêm rau củ
async function addVegetable() {
  const name = document.getElementById('name').value;
  const price = document.getElementById('price').value;
  const group = document.getElementById('group').value;
  const description = document.getElementById('description').value;

  const newVeg = { name, price, group, description };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newVeg)
    });
    const data = await res.json();
    alert(data.message);
    fetchVegetables();
  } catch (err) {
    alert('Thêm rau củ thất bại');
  }
}

// Xóa rau củ
async function deleteVegetable(id) {
  if (!confirm('Bạn có chắc muốn xóa rau củ này?')) return;
  try {
    const res = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message);
    fetchVegetables();
  } catch (err) {
    alert('Xóa thất bại');
  }
}

// Sửa rau củ
function editVegetable(id) {
  const name = prompt('Tên mới (bỏ trống nếu không đổi):');
  const price = prompt('Giá mới (bỏ trống nếu không đổi):');
  const description = prompt('Mô tả mới (bỏ trống nếu không đổi):');

  const updated = {};
  if (name) updated.name = name;
  if (price) updated.price = Number(price);
  if (description) updated.description = description;

  fetch(`${API_URL}?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || 'Cập nhật thành công');
      fetchVegetables();
    })
    .catch(err => alert('Lỗi cập nhật'));
}

// Khởi chạy
window.onload = fetchVegetables;
