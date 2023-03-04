<?php

class SessionMapper extends Mapper
{
  protected static string $entity_type = "Session";
  protected static string $table = "sessions";
  protected static array $record_info = ['description', 'date', 'time', 'project_id'];

  public static function getAllByUser(User $user, array $filters = []): array
  {
    return DB::getDB()->select(
      'sessions.*, projects.name as project_name, projects.color as color',
      'users join projects join sessions on users.id = projects.user_id and projects.id = sessions.project_id',
      ['users.id' => $user->get('id'), ...$filters]
    );
  }

  public static function getByUser(User $user, array $filters = []): ?Session
  {
    /**
     * Returns the first session found in database matching the specified filters
     */
    $user_sessions = static::getAllByUser($user, $filters);
    if (count($user_sessions)) {
      $session = new Session($user_sessions[0]['id']);
      $session->load($user_sessions[0]);
      return $session;
    }

    return null;
  }

  public static function getLatestByUser($user, $last=null): array
  {
    $portion = $last ? "and sessions.id < $last" : "";

    return DB::getDB()->select(
      'sessions.*, projects.name as project_name, projects.color as color',
      'users join projects join sessions on users.id = projects.user_id and projects.id = sessions.project_id',
      ['users.id' => $user->get('id'), "$portion ORDER BY sessions.id desc limit 30"]
    );
  }
}
