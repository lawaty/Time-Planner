<?php

class ProjectMapper extends Mapper
{
  protected static string $entity_type = 'Project';
  protected static string $table = 'projects';
  public static array $record_info = ['name', 'color', 'user_id'];

  public static function getByUser(User $user, array $filters = []): ?Project
  {
    return static::get(['user_id' => $user->get('id'), ...$filters]);
  }

  public static function getAllByUser(User $user, array $filters = []): Entities
  {
    return static::getAll(['user_id' => $user->get('id'), ...$filters]);
  }

  public function getOwner(): User
  {
    $user_data = DB::getDB()->select(UserMapper::$record_info, 'users join projects on users.id = projects.user_id', ['projects.id' => $this->entity->get('id')])[0];
    $user = new User($user_data['id']);
    $user->load($user_data);
    return $user;
  }
}
