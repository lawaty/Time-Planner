<?php

spl_autoload_register(function ($class_name) {
  $path = DEPENDENCIES[$class_name];
  $temp = explode('\\', $class_name);
  $file_name = end($temp);
  require "$path/$file_name.php";
});
