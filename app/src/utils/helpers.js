import formatTime from 'date-format';

let userList = [
]


const createMessage = (messageText, username) => {
    return {
        messageText,
        username,
        createdAt: formatTime("dd/MM/yyyy - hh:mm", new Date()),
    };
};

const getUserList = (room) => {
    return userList.filter(user => user.room === room);
}

const addUser = (newUser) => {
    const isUserExist = userList.some(user => user.username === newUser.username);

    if (!isUserExist) {
        userList.push(newUser);
    }
}

const removeUser = (socketId) => {
    const index = userList.findIndex(user => user.id === socketId);

    if (index !== -1) {
        const removedUser = userList.splice(index, 1)[0];
        return removedUser;
    }

    return null;
};

const findUser = (id) => {
    return userList.find(user => user.id === id);
}


export { createMessage, getUserList, addUser, removeUser, findUser }