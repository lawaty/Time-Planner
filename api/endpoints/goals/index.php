<?php

class Get extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'project_id' => [false, Regex::ID]
    ], $_GET);
  }

  public function handle(): Response
  {
    $date = (new Ndate())->toString(Ndate::DATE);
    var_dump($date);
    $goals = GoalMapper::getAllByUser($this->user);
    $today_sessions = SessionMapper::getAllByUser($this->user, ["and sessions.date like '$date%'"]);

    foreach ($today_sessions as $i => $session) {
      foreach ($goals as &$goal) {
        echo $goal['project_id']. ' ' . $session['project_id'];
        if ($goal['project_id'] == $session['project_id']) {
          $goal['percent'] = isset($goal['percent']) ? $goal['percent'] + (new Ndate($session['time']))->toMinutes() : (new Ndate($session['time']))->toMinutes();
          unset($today_sessions[$i]);
        }
      }
    }
    foreach($goals as &$goal)
      $goal['percent'] = intval($goal['percent'] / $goal['goal_time'] * 100);

    return new Response(SUCCESS, $goals);
  }
}
