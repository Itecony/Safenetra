const clients = new Map();

export const register_client = (ws, user) => {

    clients.set(ws, {
        user_id: user.id,
        role: user.role
    });

};

export const remove_client = (ws) => {
    clients.delete(ws);
};

export const get_clients = () => clients;