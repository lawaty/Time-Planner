<?php

class Get extends Endpoint
{
  public function __construct()
  {
    $this->init([], $_GET);
  }

  public function handle(): Response
  {
    $session = SessionMapper::get(['id' => 32]);

    $today_goals = GoalMapper::getAll();

    foreach ($today_goals as $goal) {
      $goal->calcSession($session);
      // $goal->getMapper()->save();
    }

    return new Response(SUCCESS);
  }
}
