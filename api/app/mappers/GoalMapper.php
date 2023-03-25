<?php

class GoalMapper extends Mapper
{
  public static function formatCondition($date){
    $day = (new Ndate($date))->format('D');
    return "(goals.date LIKE '%$date%' OR goals.day LIKE '%$day%' AND goals.repeat = '1')";
  }

  protected static string $entity_type = 'Goal';
  protected static string $table = 'goals';
  public static array $required = ['project_id', 'amount', 'date', 'day', 'repeat'];

  public static function getAllByUser(User $user, array $filters): Entities
  {
    return new Entities(DB::getDB()->select(
      'goals.id as id, goals.amount, goals.date, goals.day, goals.repeat, projects.id as project_id',
      'goals join projects on goals.project_id = projects.id',
      ['projects.user_id' => $user->get('id'), ...$filters]
    ), 'Goal');
  }

  public static function getByUser(User $user, array $filters): ?Goal
  {
    $user_goals = static::getAllByUser($user, $filters);
    if (count($user_goals))
      return $user_goals[0];

    return null;
  }
}
