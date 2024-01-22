<?php

$creations = [
  'users' => 'CREATE TABLE IF NOT EXISTS users (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    insertion_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_UN_1 UNIQUE (username),
    CONSTRAINT users_UN_2 UNIQUE (email)
  )',
  'projects' => 'CREATE TABLE IF NOT EXISTS projects (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    color TEXT NOT NULL,
    insertion_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT projects_UN_1 UNIQUE (user_id,name),
    CONSTRAINT projects_UN_2 UNIQUE (user_id,color),
    CONSTRAINT projects_FK FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
  )',
  'sessions' => 'CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    project_id INTEGER NOT NULL,
    insertion_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sessions_FK FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
  )',
  'goals' => 'CREATE TABLE IF NOT EXISTS goals (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
    project_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    date TEXT NOT NULL,
    day TEXT NOT NULL,
    repeat INTEGER NOT NULL,
    insertion_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT goals_FK FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
  )',
];

$insertions = [];