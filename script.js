let currentUserEmail = ""; // Lưu email để biết ai đang up ảnh

// 1. Chuyển Tab (Tìm Gia Sư, Mẹo...)
function openTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    // Nếu chuyển tab, nhớ đóng trang chủ
    if (tabId !== 'home') document.getElementById('home').classList.remove('active');
}

// 2. Modal Đăng nhập/Đăng ký
function openAuthModal() { document.getElementById('auth-modal').style.display = 'flex'; }
function closeAuthModal() { document.getElementById('auth-modal').style.display = 'none'; }
function switchAuth(type) {
    document.getElementById('login-form').classList.toggle('active-form', type === 'login');
    document.getElementById('register-form').classList.toggle('active-form', type === 'register');
}

// 3. Xử lý ĐĂNG KÝ
async function handleRegister() {
    const inputs = document.querySelectorAll('#register-form .auth-input');
    const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ fullname: inputs[0].value, email: inputs[1].value, password: inputs[2].value })
    });
    const data = await response.json();
    alert(data.message);
    if(response.ok) switchAuth('login'); // ĐK xong chuyển sang ĐN
}

// 4. Xử lý ĐĂNG NHẬP
async function handleLogin() {
    const inputs = document.querySelectorAll('#login-form .auth-input');
    const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ email: inputs[0].value, password: inputs[1].value })
    });
    const data = await response.json();
    if(response.ok) {
        // ĐN thành công -> Ẩn nút ĐN cũ, hiện Avatar tròn
        currentUserEmail = data.email;
        document.getElementById('login-btn-nav').style.display = 'none';
        document.getElementById('user-profile-section').style.display = 'block';
        document.getElementById('dropdown-username').innerText = data.fullname;
        
        // Cập nhật Avatar (hiện chữ cái đầu hoặc ảnh nếu có)
        updateAvatarUI(data.avatar, data.fullname);
        closeAuthModal();
    } else { alert(data.message); }
}

// 5. Cập nhật UI cho Avatar tròn
function updateAvatarUI(path, name) {
    const avatarBox = document.getElementById('main-avatar');
    if(path) {
        avatarBox.innerHTML = `<img src="http://localhost:5000${path}" style="width:100%;height:100%;object-fit:cover;">`;
    } else {
        avatarBox.innerText = name.charAt(0).toUpperCase();
    }
}

// 6. Xử lý UPLOAD ẢNH
document.getElementById('avatar-input').onchange = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('email', currentUserEmail);

    const response = await fetch('http://localhost:5000/api/upload-avatar', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    if(response.ok) {
        // Đổi cái hình tròn thành ảnh vừa up (cắt bỏ phần http:localhost:5000 để updateAvatarUI hiểu)
        const purePath = data.avatarUrl.replace('http://localhost:5000', '');
        updateAvatarUI(purePath, "");
        alert("Avatar mới quá xịn sếp ơi!");
    }
};

function toggleDropdown() { document.getElementById('user-dropdown').classList.toggle('show'); }
function logout() { location.reload(); } // Đăng xuất = load lại trang

// Bấm ra ngoài thì đóng modal hoặc dropdown
window.onclick = (e) => {
    if (e.target.classList.contains('modal-overlay')) closeAuthModal();
}



























function openProfileModal() {
    document.getElementById("profile-modal").style.display = "flex";
    document.getElementById("user-dropdown").classList.remove("show");
    loadProfile();
}

function closeProfileModal() {
    document.getElementById("profile-modal").style.display = "none";
}

function saveProfile() {
    const profileData = {
        isTutor: document.getElementById("profile-is-tutor").value,
        fullName: document.getElementById("profile-fullname").value,
        score: document.getElementById("profile-score").value,
        awards: document.getElementById("profile-awards").value,
        location: document.getElementById("profile-location").value,
        phone: document.getElementById("profile-phone").value,
        bio: document.getElementById("profile-bio").value
    };

    localStorage.setItem("edututor_profile", JSON.stringify(profileData));

    if (profileData.fullName) {
        const dropdownUsername = document.getElementById("dropdown-username");
        if (dropdownUsername) dropdownUsername.textContent = profileData.fullName;

        const mainAvatar = document.getElementById("main-avatar");
        if (mainAvatar) mainAvatar.textContent = profileData.fullName.charAt(0).toUpperCase();
    }

    renderProfilePreview(profileData);

    closeProfileModal();
    openTab('tutors');

    if (profileData.location) {
        filterTutorsByLocation(profileData.location);
    } else {
        filterTutorsByLocation('ALL');
    }

    alert("Đã lưu hồ sơ và chuyển sang mục Tìm Gia Sư!");
}

function loadProfile() {
    const savedProfile = localStorage.getItem("edututor_profile");
    if (!savedProfile) return;

    const profileData = JSON.parse(savedProfile);

    document.getElementById("profile-is-tutor").value = profileData.isTutor || "";
    document.getElementById("profile-fullname").value = profileData.fullName || "";
    document.getElementById("profile-score").value = profileData.score || "";
    document.getElementById("profile-awards").value = profileData.awards || "";
    document.getElementById("profile-location").value = profileData.location || "";
    document.getElementById("profile-phone").value = profileData.phone || "";
    document.getElementById("profile-bio").value = profileData.bio || "";

    if (profileData.fullName) {
        const dropdownUsername = document.getElementById("dropdown-username");
        if (dropdownUsername) dropdownUsername.textContent = profileData.fullName;

        const mainAvatar = document.getElementById("main-avatar");
        if (mainAvatar) mainAvatar.textContent = profileData.fullName.charAt(0).toUpperCase();
    }

    renderProfilePreview(profileData);
}

function renderProfilePreview(profile) {
    const preview = document.getElementById("profile-preview");
    if (!preview) return;

    preview.innerHTML = `
        <strong>Thông tin hồ sơ</strong><br>
        <b>Muốn làm gia sư:</b> ${profile.isTutor || "Chưa cập nhật"}<br>
        <b>Họ và tên:</b> ${profile.fullName || "Chưa cập nhật"}<br>
        <b>Điểm số:</b> ${profile.score || "Chưa cập nhật"}<br>
        <b>Giải thưởng:</b> ${profile.awards || "Chưa cập nhật"}<br>
        <b>Khu vực sinh sống:</b> ${profile.location || "Chưa cập nhật"}<br>
        <b>Số điện thoại:</b> ${profile.phone || "Chưa cập nhật"}<br>
        <b>Giới thiệu:</b> ${profile.bio || "Chưa cập nhật"}
    `;
}

window.addEventListener("load", function () {
    loadProfile();
});

window.addEventListener("click", function (e) {
    const profileModal = document.getElementById("profile-modal");
    if (e.target === profileModal) {
        closeProfileModal();
    }
});












function filterTutorsByLocation(location) {
    const tutorCards = document.querySelectorAll(".tutor-card");
    const noTutorMessage = document.getElementById("no-tutor-message");
    let visibleCount = 0;

    tutorCards.forEach(card => {
        const tutorLocation = card.getAttribute("data-location");

        if (location === "ALL" || tutorLocation === location) {
            card.style.display = "block";
            visibleCount++;
        } else {
            card.style.display = "none";
        }
    });

    if (noTutorMessage) {
        noTutorMessage.style.display = visibleCount === 0 ? "block" : "none";
    }
}