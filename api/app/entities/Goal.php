<?php

class Goal extends Entity
{
  protected static string $mapper_type = 'GoalMapper';

  protected int $project_id;
  protected int $amount;
  protected string $date;
  protected string $day;
  protected string $repeat;

  protected int $progress = 0;

  public function calcSession(Session $session): void
  {
    var_dump($session);
    $total_time = $this->get('amount') * $this->get('progress') / 100;
    $time_slices = explode(':', $session->get('time'));
    $time_in_mins = intval($time_slices[0]) * 60 + intval($time_slices[1]);
    $total_time += $time_in_mins;

    $progress = $total_time / $this->get('amount') * 100;
    if($progress > 100)
      $progress = 100;

    $this->set('progress', $progress);
  }
}
