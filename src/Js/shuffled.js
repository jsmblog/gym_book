const shuffled = (ARRAY_USERS) => {
    for (let i = ARRAY_USERS.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ARRAY_USERS[i],ARRAY_USERS[j]] = [ARRAY_USERS[j],ARRAY_USERS[i]];
    }
    return ARRAY_USERS ;
}
export default shuffled;