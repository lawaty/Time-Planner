<?php

class GetWeekly extends Authenticated
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
      $this->request['date'] = Ndate::now();

    $dates = (new Ndate($this->request['date']))->getWeekDates();

    $week_goals = GoalMapper::getAllByUser(
      $this->user,
      [
        ' AND (',
        'goals.date' => $dates,
        ' OR goals.day != "NIL")'
      ]
    );

    $formatted = [];
    foreach ($week_goals as $goal) {
      $project_id = $goal->get('project_id');
      if (!isset($formatted[$project_id]))
        $formatted[$project_id] = new Goal(-1);

      $formatted[$project_id]->set('amount', $formatted[$project_id]->get('amount') + $goal->get('amount'));
    }

    $week_sessions = SessionMapper::getAllByUser(
      $this->user,
      [
        ' AND',
        'sessions.date' => $dates
      ]
    );

    foreach($week_sessions as $session)
      $formatted[$session->get('project_id')]->calcSession($session);

    foreach ($formatted as &$goal)
    $goal = $goal->get('amount', 'progress');

    return new Response(SUCCESS, $formatted);
  }
}
