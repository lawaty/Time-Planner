<?php

date_default_timezone_set('Africa/Cairo');
ini_set("precision", 3);

// Locations
const LOCAL = ".";
const LOG = LOCAL."/app/logs";

const DEBUG = false;

// Sqlite DB
define("DB_PATH", "core/database/db.db");

// JWT Secret
const SECRET = 'lol';
