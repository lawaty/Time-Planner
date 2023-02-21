<?php

$creations = [
  'users' => 'CREATE TABLE IF NOT EXISTS users (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    CONSTRAINT users_UN_1 UNIQUE (username),
    CONSTRAINT users_UN_2 UNIQUE (email)
  )',
  'projects' => 'CREATE TABLE IF NOT EXISTS projects (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    color TEXT NOT NULL,
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
    CONSTRAINT sessions_FK FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
  )',
  'goals' => 'CREATE TABLE goals (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    time INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    CONSTRAINT goals_UN UNIQUE (project_id),
    CONSTRAINT goals_FK FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
  )'
];

$insertions = [];

$db = new PDO('sqlite:db.db');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Dropping
if (isset($_GET['drop'])) {
  echo "<br>Dropping Tables...<br>";
  if ($_GET['drop'] == 'all')
    $tables = array_keys($creations);
  else
    $tables = explode(',', $_GET['drop']);

  $successes = 0;
  $failures = 0;
  foreach ($tables as $table) {
    echo "<br>Dropping Table '$table'<br>";
    $query = drop($table);
    $stmt = $db->prepare($query);
    try {
      $result = $stmt->execute();
      $successes++;
    } catch (PDOException $e) {
      echo "<br>fail: $query<br>";
      $failures++;
    }
  }
  if (!$failures)
    echo "<br>No Failures<br>";

  echo "$successes Successes<br>";
}

if (isset($_GET['copy'])) {
  $to_be_copied = explode('.', $_GET['copy']);
  $db_path = $to_be_copied[0] . '.db';
  $db_table = $to_be_copied[1];

  $db_2 = new PDO("sqlite:$db_path");
  $db_2->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  $stmt = $db_2->prepare("select * from $db_table");
  $stmt->execute();
  $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

  foreach ($records as $record) {
    $keys = array_keys($record);
    unset($keys['id']);

    array_push($insertions[$db_table], [
      $keys,
      array_values($record)
    ]);
  }
}

// Creating
echo "<br>Creating Tables...<br>";

$successes = 0;
$failures = 0;
foreach ($creations as $table => $query) {
  $stmt = $db->prepare($query);
  try {
    $result = $stmt->execute();
    $successes++;
  } catch (PDOException $e) {
    echo "<br>fail: $query<br>said: " . $e->getMessage() . "<br>";
    $failures++;
  }
}

if (!$failures)
  echo "<br>No Failures<br>";

echo "$successes Successes<br>";

// Inserting
echo "<br>Checking and Applying Insertions... <br>";

$successes = 0;
$failures = 0;
foreach ($insertions as $table => $insertions) {
  foreach ($insertions as $insertion) {
    if (recordExists($table, $insertion)) {
      $successes++;
      continue;
    }
    $query = insert($table, $insertion);
    $stmt = $db->prepare($query);
    try {
      $result = $stmt->execute();
      $successes++;
    } catch (PDOException $e) {
      echo "<br>fail: " . $query . "<br>";
      $failures++;
    }
  }
}
if (!$failures)
  echo "<br>No Failures<br>";

echo "$successes Successes<br>";









function drop($table)
{
  return 'DROP TABLE IF EXISTS "' . $table . '"';
}

function recordExists($table, $params)
{
  $query = "select * from $table where ";
  $keys = $params[0];
  $values = $params[1];
  foreach ($keys as $i => $key) {
    if (strlen($values[$i]) == 0)
      continue;

    $query .= "$key = '" . $values[$i] . "'";
    if ($i != count($values) - 1)
      $query .= " and ";
  }
  $stmt = $GLOBALS['db']->prepare($query);
  $stmt->execute();
  return (bool) count($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function insert($table, $insertion)
{
  return "INSERT INTO $table (\"" . implode('","', $insertion[0]) . "\") VALUES (\"" . implode('","', $insertion[1]) . "\")";
}
