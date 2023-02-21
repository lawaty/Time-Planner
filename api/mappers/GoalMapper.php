<?php

class GoalMapper extends Mapper
{
  protected static string $entity_type = 'Goal';
  protected static string $table = 'goals';
  protected static array $record_info = ['time', 'project_id'];

  public static function getAllByUser(User $user): array
  {
    return DB::getDB()->select(
      'goals.id as id, goals.time as goal_time, projects.id as project_id, projects.name as project_name, projects.color as project_color',
      'goals join projects on goals.project_id = projects.id',
      ['projects.user_id' => $user->get('id')]
    );
  }

  public static function getByUser(User $user, array $filters = []): ?Goal
  {
    $user_goals = static::getAllByUser($user, $filters);
    if (count($user_goals)) {
      $goal = new Goal($user_goals[0]['id']);
      $goal->load($user_goals[0]);
      return $goal;
    }

    return null;
  }
}
