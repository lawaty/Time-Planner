<?php

class ProjectMapper extends Mapper
{
  protected static string $entity_type = 'Project';
  protected static string $table = 'projects';
  protected static array $record_info = ['name', 'color', 'user_id'];

  public static function getByUser(User $user, array $filters = []): ?Project
  {
    return static::get(['user_id' => $user->get('id'), ...$filters]);
  }

  public static function getAllByUser(User $user, array $filters = []): Entities
  {
    return static::getAll(['user_id' => $user->get('id'), ...$filters]);
  }
}
