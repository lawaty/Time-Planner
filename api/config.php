<?php

date_default_timezone_set('Africa/Cairo');
ini_set("precision", 3);

// Locations
const LOCAL = ".";
const LOG = LOCAL."/logs";

const DEBUG = false;

// Sqlite DB
define("DB_PATH", "database/db.db");

const DEPENDENCIES = [
  // Global
  'DB' => 'database',

  // Libraries
  'Firebase\JWT\JWT' => "lib/php-jwt/src",
  'Firebase\JWT\Key' => "lib/php-jwt/src",

  // Helpers
  'Validator' => 'helpers/validation',
  'ValidationUnit' => 'helpers/validation',
  'Curl' => 'helpers',
  'Regex' => 'helpers',
  'Ndate' => 'helpers',
  'Entities' => 'helpers',
  'AssocEntities' => 'helpers',

  // Bases and Interfaces
  'Authenticated' => 'bases',
  'Entity' => 'bases',
  'Mapper' => 'bases',
  'JoinMapper' => 'bases',
  'IEntity' => 'bases',
  'IMapper' => 'bases',

  // Exceptions
  'NegativeSectionReached' => 'exceptions',
  'InvalidArguments' => 'exceptions',

  'BadRequest' => 'exceptions',
  'Forbidden' => 'exceptions',
  'NotFound' => 'exceptions',
  'NotModified' => 'exceptions',
  'Old' => 'exceptions',
  'NotMatching' => 'exceptions',
  'Conflict' => 'exceptions',
  'Fail' => 'exceptions',

  'PropertyNotExisting' => 'exceptions',
  'RequiredPropertyNotFound' => 'exceptions',
  'IncompleteModel' => 'exceptions',
  'InvalidID' => 'exceptions',
  'IncompatibleModels' => 'exceptions',

  'UniquenessViolated' => 'exceptions',
  'ForeignKeyViolated' => 'exceptions',





  // Entities
  'User' => 'entities',
  'UserMapper' => 'mappers',
  'Project' => 'entities',
  'ProjectMapper' => 'mappers',
  'Session' => 'entities',
  'SessionMapper' => 'mappers',];

// JWT Secret
const SECRET = 'lol';
