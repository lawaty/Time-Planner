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
    if(isset($this->request['date'])){
      $date = new Ndate($this->request['date']);
      $day = $date->getDay();
      $date = $date->toString(Ndate::DATE);
    }
    else{
      $date = (new Ndate());
      $day = $date->getDay();
      $date = $date->toString(Ndate::DATE);
    }

    return new Response(SUCCESS, GoalMapper::getAllByUser(
      $this->user,
      "AND (goals.date LIKE '%$date%' OR goals.day LIKE '%$day%' AND goals.repeat = '1')"
    ));
  }
}
