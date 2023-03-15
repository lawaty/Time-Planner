<?php

class ProjectMapper extends Mapper
{
  protected static string $entity_type = 'Project';
  protected static string $table = 'projects';
  public static array $required = ['name', 'color', 'user_id'];

  public static function getByUser(User $user, array $filters = []): ?Project
  {
    return static::get(['user_id' => $user->get('id'), ...$filters]);
  }

  public static function getAllByUser(User $user, array $filters = []): Entities
  {
    return static::getAll(['user_id' => $user->get('id'), ...$filters]);
  }

  public function getOwner(): ?User
  {
    $user_data = DB::getDB()->select("users.*", 'users join projects on users.id = projects.user_id', ['projects.id' => $this->entity->get('id')]);
    if(!count($user_data))
      return null;

    $user_data = $user_data[0];
    $user = new User($user_data['id']);
    $user->load($user_data);
    return $user;
  }
}
