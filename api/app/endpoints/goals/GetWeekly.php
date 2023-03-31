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

    $temp = GoalMapper::getAllByUser(
      $this->user,
      [
        ' AND (',
        'goals.date' => $dates,
        ' OR goals.day != "NIL")'
      ]
    );

    $week_goals = [];
    foreach($temp as $goal) {
      if (
        !isset($week_goals[$goal->get('project_id')][$goal->get('date')]) ||
        $goal->get('day') == 'NIL'
      )
      $week_goals[$goal->get('project_id')][$goal->get('date')] = $goal;
    }
    $temp = $week_goals;
    $week_goals = [];
    foreach($temp as $i => $goals)
      array_push($week_goals, ...array_values($goals));
    
    foreach ($week_goals as $goal) {
      if (
        !isset($formatted[$goal->get('project_id')]) ||
        $goal->get('day') == 'NIL'
      )
        $formatted[$goal->get('project_id')] = $goal;
    }

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

    foreach ($week_sessions as $session)
      if(isset($formatted[$session->get('project_id')]))
        $formatted[$session->get('project_id')]->calcSession($session);

    foreach ($formatted as &$goal)
      $goal = $goal->get('amount', 'progress');

    return new Response(SUCCESS, $formatted);
  }
}
