// Khởi tạo kết nối socket
const socket = io();

// Gửi tin nhắn
const sendMessage = (messageText) => {
    const acknowledgements = (errors) => {
        if (errors) {
            alert("Tin nhắn không hợp lệ");
        } else {
            console.log("Tin nhắn đã gửi thành công");
        }
    };

    socket.emit("send message from client to server", messageText, acknowledgements);

    // Xóa giá trị input sau khi gửi
    document.getElementById("input-messages").value = ""; // Xóa giá trị input
};

// Nhận tin nhắn từ server
const handleIncomingMessage = (messages) => {
    console.log("Message: ", messages);
    addMessageToDOM([messages]);
};

// Gửi vị trí
const shareLocation = () => {
    if (!navigator.geolocation) {
        return alert("Trình duyệt đang dùng không hỗ trợ tìm vị trí");
    }

    navigator.geolocation.getCurrentPosition(({ coords }) => {
        socket.emit("share location from client to server", {
            latitude: coords.latitude,
            longitude: coords.longitude,
        });
    });
};

// Nhận vị trí từ server
const handleIncomingLocation = (linkLocation) => {
    console.log("Link Location: ", linkLocation);
};

// Xử lý query string
const initRoomAndUsername = () => {
    const { room, username } = Qs.parse(location.search, { ignoreQueryPrefix: true });
    socket.emit("join romm form client to server", { room, username });
    document.getElementById("title-room").innerHTML = room;
};

// Nhận và hiển thị danh sách người dùng
const handleUserList = (userList) => {
    getCurrentUserList(userList);
};

// Hàm hiển thị tin nhắn lên DOM
const addMessageToDOM = (messages) => {
    const messagesContainer = document.getElementById("messages");
    const messagesHTML = messages
        .map(({ username = "Hệ thống", createdAt = "Không rõ thời gian", messageText }) => `
            <div class="message-item">
                <div class="message__row1">
                    <p class="message__name">${username}</p>
                    <p class="message__date">${createdAt}</p>
                </div>
                <div class="message__row2">
                    <p class="message__content">${messageText}</p>
                </div>
            </div>
        `)
        .join("");

    messagesContainer.innerHTML += messagesHTML;
};

// Hàm hiển thị người dùng trong room
const getCurrentUserList = (userList) => {
    const listContainer = document.getElementById("list-user");
    const listHTML = userList
        .map(({ username = "Ẩn danh" }) => `
            <li class="app__item-user">${username}</li>
        `)
        .join("");

    listContainer.innerHTML = listHTML;
};

// Thiết lập các sự kiện socket
const setupSocketEvents = () => {
    socket.on("send message from server to client", handleIncomingMessage);
    socket.on("share location from server to client", handleIncomingLocation);
    socket.on("send user list from server to client", handleUserList);
};

// Khởi tạo ứng dụng
const initApp = () => {
    setupSocketEvents();
    initRoomAndUsername();

    // Thêm sự kiện gửi tin nhắn
    document.getElementById("form-messages").addEventListener("submit", (e) => {
        e.preventDefault();
        const messageText = document.getElementById("input-messages").value;
        sendMessage(messageText);
    });

    // Thêm sự kiện chia sẻ vị trí
    document.getElementById("btn-share-location").addEventListener("click", shareLocation);
};

// Khởi chạy ứng dụng
initApp();
