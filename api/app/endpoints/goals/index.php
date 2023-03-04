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
    $date = (new Ndate());
    $day = $date->getDay();
    $date = $date->toString(Ndate::DATE);

    return new Response(SUCCESS, GoalMapper::getAllByUser(
      $this->user,
      "AND (goals.date_day LIKE '%$date%' OR goals.date_day LIKE '%$day%' AND goals.repeat = '1')"
    ));
  }
}
