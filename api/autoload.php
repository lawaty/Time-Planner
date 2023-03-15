<?php

const DEPENDENCIES = [
  // Global
  'DB' => 'core/database',

  // Libraries
  'Firebase\JWT\JWT' => "core/lib/php-jwt/src",
  'Firebase\JWT\Key' => "core/lib/php-jwt/src",

  // Helpers
  'Validator' => 'app/helpers/validation',
  'ValidationUnit' => 'app/helpers/validation',
  'Curl' => 'app/helpers',
  'Regex' => 'app/helpers',
  'Ndate' => 'app/helpers',
  'Entities' => 'app/helpers',
  'AssocEntities' => 'app/helpers',

  // Bases and Interfaces
  'Authenticated' => 'core/bases',
  'Entity' => 'core/bases',
  'Mapper' => 'core/bases',
  'JoinMapper' => 'core/bases',

  // Exceptions
  'NegativeSectionReached' => 'core/exceptions',
  'InvalidArguments' => 'core/exceptions',

  'BadRequest' => 'core/exceptions',
  'Forbidden' => 'core/exceptions',
  'NotFound' => 'core/exceptions',
  'NotModified' => 'core/exceptions',
  'Old' => 'core/exceptions',
  'NotMatching' => 'core/exceptions',
  'Conflict' => 'core/exceptions',
  'Fail' => 'core/exceptions',

  'PropertyNotExisting' => 'core/exceptions',
  'RequiredPropertyNotFound' => 'core/exceptions',
  'IncompleteModel' => 'core/exceptions',
  'InvalidID' => 'core/exceptions',
  'IncompatibleModels' => 'core/exceptions',

  'UniquenessViolated' => 'core/exceptions',
  'ForeignKeyViolated' => 'core/exceptions',

  // Entities
  'User' => 'app/entities',
  'UserMapper' => 'app/mappers',
  'Project' => 'app/entities',
  'ProjectMapper' => 'app/mappers',
  'Session' => 'app/entities',
  'SessionMapper' => 'app/mappers',
  'Goal' => 'app/entities',
  'GoalMapper' => 'app/mappers',
];

spl_autoload_register(function ($class_name) {
  $path = DEPENDENCIES[$class_name];
  $temp = explode('\\', $class_name);
  $file_name = end($temp);
  require "$path/$file_name.php";
});
