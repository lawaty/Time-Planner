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

    // get all goals found for that date
    $user_goals = GoalMapper::getAllByUser(
      $this->user,
      [
        ' AND ' . GoalMapper::formatCondition($date)
      ]
    );

    $formatted = [];
    foreach ($user_goals as $goal) {
      if (
        !isset($formatted[$goal->get('project_id')]) ||
        $goal->get('day') == 'NIL'
      )
        $formatted[$goal->get('project_id')] = $goal;
    }


    // Now we want to calculate the progress for all found goals
    $sessions = SessionMapper::getAllByUser($this->user, [
      'sessions.date' => $date
    ]);

    foreach ($sessions as $session)
      $formatted[$session->get('project_id')]->calcSession($session);

    foreach ($formatted as &$goal)
      $goal = $goal->get('id', 'amount', 'date', 'day', 'repeat', 'progress', 'project_id');

    var_dump($formatted);

    return new Response(SUCCESS, array_values($formatted));
  }
}
