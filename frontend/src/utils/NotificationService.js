const NotificationService = {
    requestPermission: async () => {
        if (!("Notification" in window)) {
            console.log("This browser does not support notifications");
            return;
        }

        if (Notification.permission !== "granted") {
            await Notification.requestPermission();
        }
    },

    showNotification: (title, options) => {
        if (Notification.permission === "granted") {
            new Notification(title, options);
        }
    },

    showTransactionNotification: (type, amount, fromAccount, toAccount) => {
        const title = `Transaction ${type} Successful`;
        const options = {
            body: `Amount: $${amount}\n${
                type === 'received' 
                    ? `Received from: ${fromAccount}`
                    : `Sent to: ${toAccount}`
            }`,
            icon: '/path/to/your/icon.png', // Add your icon path
            badge: '/path/to/your/badge.png', // Add your badge path
        };

        NotificationService.showNotification(title, options);
    }
};

export default NotificationService; 