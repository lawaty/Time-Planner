<?php

class UserMapper extends Mapper
{
  protected static string $table = "users";
  protected static string $entity_type = "User";
  protected static array $record_info = ['username', 'password', 'email'];
}
