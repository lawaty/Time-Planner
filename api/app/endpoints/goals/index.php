<?php

class Get extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'date' => [false, Regex::DATE]
    ], $_GET);
  }

  public function handle(): Response
  {
    if (!isset($this->request['date']))
      $date = Ndate::now();
    else $date = $this->request['date'];

    $user_goals = GoalMapper::getAllByUser(
      $this->user,
      [
        ' AND ',
        GoalMapper::formatCondition($date)
      ]
    );

    // Allow only one goal per day to exist (one-time goals have more priority than fixed goals)
    $formatted = [];
    foreach ($user_goals as $goal) {
      if ($goal->get('day') == 'NIL' || !isset($formatted[$goal->get('date')]))
        $formatted[$goal->get('project_id')] = $goal;
      // $formatted[$goal->get('project_id')] = $goal->get('id', 'amount', 'date', 'day', 'repeat');
    }

    // Calculating progress for every goal
    $sessions = SessionMapper::getAllByUser($this->user, [
      ' AND date = ' . Ndate::now()
    ]);

    foreach ($sessions as $session)
      $formatted[$session->get('project_id')]->calcSession($session);

    foreach($formatted as &$goal)
      $goal = $goal->get('id', 'amount', 'date', 'day', 'repeat', 'progress');

    return new Response(SUCCESS, $formatted);
  }
}
