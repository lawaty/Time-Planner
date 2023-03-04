<?php

class GoalMapper extends Mapper
{
  protected static string $entity_type = 'Goal';
  protected static string $table = 'goals';
  protected static array $record_info = ['project_id', 'amount', 'date_day', 'repeat', 'progress'];

  public static function create(array $data): Goal
  {
    $data['progress'] = 0;
    return parent::create($data);
  }

  public static function getAllByUser(User $user, ...$filters): array
  {
    return DB::getDB()->select(
      'goals.id as id, goals.amount as goal_amount, goals.date_day, goals.repeat, goals.progress, projects.id as project_id, projects.name as project_name, projects.color as color',
      'goals join projects on goals.project_id = projects.id',
      ['projects.user_id' => $user->get('id'), ...$filters]
    );
  }

  public static function getByUser(User $user, ...$filters): ?Goal
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
