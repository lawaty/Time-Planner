<?php

class GoalMapper extends Mapper
{
  public static function formatCondition($date){
    $day = (new Ndate($date))->getDay();
    return "(goals.date LIKE '%$date%' OR goals.day LIKE '%$day%' AND goals.repeat = '1')";
  }

  protected static string $entity_type = 'Goal';
  protected static string $table = 'goals';
  protected static array $required = ['project_id', 'amount', 'date', 'day', 'repeat'];
  protected static array $optional = ['progress'];

  public static function create(array $data, User $user = null): Goal
  {
    if (!isset($data['project_id']))
      throw new RequiredPropertyNotFound('project_id', 'Goal');

    if (!isset($data['amount']))
      throw new RequiredPropertyNotFound('amount', 'Goal');

    if (!$user) {
      $user = (new Project($data['project_id']))->getMapper()->getOwner();
      if(!$user)
        throw new NotFound('Project');
    }

    $sessions = SessionMapper::getAllByUser($user);
    $data['progress'] = 0; // in mins
    foreach ($sessions as $session)
      $data['progress'] += $session->get('time');

    $data['progress'] = $data['progress'] / $data['amount'] * 100;

    return parent::create($data);
  }

  public static function getAllByUser(User $user, ...$filters): Entities
  {
    return new Entities(DB::getDB()->select(
      'goals.id as id, goals.amount, goals.date, goals.day, goals.repeat, goals.progress, projects.id as project_id',
      'goals join projects on goals.project_id = projects.id',
      ['projects.user_id' => $user->get('id'), ...$filters]
    ), 'Goal');
  }

  public static function getByUser(User $user, $filters): ?Goal
  {
    $user_goals = static::getAllByUser($user, ...$filters);
    if (count($user_goals))
      return $user_goals[0];

    return null;
  }
}
