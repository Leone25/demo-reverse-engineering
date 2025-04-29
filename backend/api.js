import express from "express";
import cookieParser from "cookie-parser";
import fs from 'fs';
import path from 'path';

import { sessionManager } from "./index.js";
import config from "./config.js";

const __dirname = path.resolve(path.dirname(''));

const api = new express.Router({ mergeParams: true });
api.use(cookieParser());
api.use(express.json());

api.use((req, res, next) => {
    req.session = sessionManager.getSession(req.cookies.EEcookie);
    next();
});

function requireAuth(req, res, next) {
    if (req.session == null) return res.sendStatus(401);
    next();
}

function requireNoAuth(req, res, next) {
    if (req.session == null) return next();
    res.sendStatus(403);
}

api.post('/session', requireNoAuth, (req, res) => {
    if (!req.body || req.body.username != config.username || req.body.password != config.password)
        return res.status(400).send("Incorrect username/password");
    res.send(sessionManager.newSession({
        useragent: req.get('user-agent')
    }));
});

api.delete('/session', requireAuth, (req, res) => {
    sessionManager.deleteSession(req.cookies.EEcookie);
    res.sendStatus(200);
})

api.get('/user', requireAuth, (req, res) => {
    res.json({
        user: config.username,
        session: req.session,
    });
});

api.get('/user/books', requireAuth, (req, res) => {
    res.json(config.books.filter(b => b.hasAccess).map(b => {
        return {
            id: b.id,
            title: b.title,
            author: b.author,
            date: b.date,
            description: b.description,
            pages: b.pages,
            thumbnail: '/api/books/thumbnails/' + b.id + '.png'
        }
    }));
})

api.get('/books', (req, res) => {
    res.json(config.books.map(b => {
        return {
            id: b.id,
            title: b.title,
            author: b.author,
            date: b.date,
            description: b.description,
            pages: b.pages,
            thumbnail: '/api/books/thumbnails/' + b.id + '.png'
        }
    }));
});

api.get('/books/:id', (req, res) => {
    let book =config.books.find(b => b.id == req.params.id);
    res.json({
        id: book.id,
        title: book.title,
        author: book.author,
        date: book.date,
        description: book.description,
        pages: book.pages,
        thumbnail: '/api/books/thumbnails/' + book.id + '.png'
    });
});

api.use('/books/thumbnails', express.static('./books/thumbnails'));

api.use('/v1/books/', express.static('./books/password'));

api.use('/v2/books/:id.pdf', requireAuth, (req, res) => {
    if (!config.books.find(b => b.id == req.params.id)) return res.sendStatus(403);

    const filePath = path.join(__dirname, 'books', `${req.params.id}.pdf`);
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.sendStatus(404);
        }
        res.sendFile(filePath);
    });
});

api.use('/v3/books/:id/bookData.json', requireAuth, async (req, res) => {
    let book = config.books.find(b => b.id == req.params.id)
    if (!book) return res.sendStatus(403);

    const dataPath = path.join(__dirname, 'books/split', req.params.id, 'bookData.json');

    let bookData = JSON.parse(await fs.promises.readFile(dataPath));

    res.json({
        id: book.id,
        title: book.title,
        author: book.author,
        date: book.date,
        description: book.description,
        pages: bookData.pages,
        thumbnail: '/books/thumbnails/' + book.id + '.png'
    });
});

api.use('/v3/books/:id/*', requireAuth, (req, res) => {
    if (!config.books.find(b => b.id == req.params.id)) return res.sendStatus(403);

    const subPath = req.params[0];
    const safeRoot = path.join(__dirname, 'books/split', req.params.id);
    const filePath = path.join(safeRoot, subPath);

    if (!filePath.startsWith(safeRoot)) {
        return res.status(400).send('Invalid path');
    }

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.sendStatus(404);
        }
        res.sendFile(filePath);
    });
});

api.use('/v4/books/:id/bookData.json', requireAuth, async (req, res) => {
    let book = config.books.find(b => b.id == req.params.id)
    if (!book) return res.sendStatus(403);

    const dataPath = path.join(__dirname, 'books/encrypted', req.params.id, 'bookData.json');

    let bookData = JSON.parse(await fs.promises.readFile(dataPath));

    res.json({
        id: book.id,
        title: book.title,
        author: book.author,
        date: book.date,
        description: book.description,
        pages: bookData.pages,
        thumbnail: '/api/books/thumbnails/' + book.id + '.png'
    });
});

api.use('/v4/books/:id/*', requireAuth, (req, res) => {
    if (!config.books.find(b => b.id == req.params.id)) return res.sendStatus(403);

    const subPath = req.params[0];
    const safeRoot = path.join(__dirname, 'books/encrypted', req.params.id);
    const filePath = path.join(safeRoot, subPath);

    if (!filePath.startsWith(safeRoot)) {
        return res.status(400).send('Invalid path');
    }

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.sendStatus(404);
        }
        res.sendFile(filePath);
    });
});

export default api;