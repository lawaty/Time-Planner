<?php

class Goal extends Entity
{
  protected static string $mapper_type = 'GoalMapper';

  protected int $project_id;
  protected int $amount;
  protected string $date;
  protected string $day;
  protected string $repeat;
  protected int $progress;

  public function calcSession(Session $session): void
  {
    $total_time = $this->get('amount') * $this->get('$progress') / 100;
    $total_time += $session->get('time');
    $progress = $total_time / $this->get('amount') * 100;
    if($progress > 100)
      $progress = 100;

    $this->set('progress', $progress);
  }
}
