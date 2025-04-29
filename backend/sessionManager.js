import fs from 'fs/promises';


export default class SessionManager {
    constructor(config) {
        this.config = config;

        this.sessions = {};
        this.saveTimeout = null;

        // autopurge
        setInterval(this.purgeOldSessions.bind(this), 1000 * 60);

        this.loadSessions();
    }

    async loadSessions() {
        await fs.readFile(this.config.sessionsFile).then(data => {
            this.sessions = JSON.parse(data);
            this.purgeOldSessions();
        }).catch(() => {
            console.log("Could not load sessions");
            this.sessions = {};
        });
    }

    saveSessions() {
        if (this.saveTimeout) return;

        this.saveTimeout = setTimeout(() => {
            this.purgeOldSessions();
            this.saveTimeout = null;
            fs.writeFile(this.config.sessionsFile, JSON.stringify(this.sessions)).catch((err) => {
                console.log("Error while saving sessions", err);
            })
        });
    }

    purgeOldSessions() {
        const now = Date.now();
        let keys = Object.keys(this.sessions);
        keys.forEach(id => {
            if (this.sessions[id].expires < now) delete this.sessions[id];
        });
        if (Object.keys(this.sessions).length < keys.length) this.saveSessions();
    }

    newSession(data = {}) {
        while(true) {
            let id = this.makeid(16);
            if (!this.sessions[id]) {
                this.sessions[id] = {...data, expires: Date.now() + 1000 * 60 * 60 * 24};
                this.saveSessions();
                return id;
            }
        }
    }

    makeid(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter += 1;
        }
        return result;
    }

    getSession(id) {
        if (this.sessions[id]) return {...this.sessions[id], id};
        return null;
    }

    deleteSession(id) {
        delete this.sessions[id];
        this.saveSessions();
    }
}