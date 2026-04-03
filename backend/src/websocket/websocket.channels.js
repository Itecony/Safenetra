const channels = new Map();

export const subscribe = (ws, channel) => {

    if (!channels.has(channel)) {
        channels.set(channel, new Set());
    }

    channels.get(channel).add(ws);
};

export const unsubscribe = (ws, channel) => {

    if (!channels.has(channel)) return;

    channels.get(channel).delete(ws);
};

export const get_channel_clients = (channel) => {
    return channels.get(channel) || new Set();
};

export const has_channel = (channel) => channels.has(channel);

export const remove_ws_from_all_channels = (ws) => {
    for (const [channel, clients] of channels.entries()) {
        clients.delete(ws);

        if (clients.size === 0) {
            channels.delete(channel);
        }
    }
};
