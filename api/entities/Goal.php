<?php

class Goal extends Entity
{
  protected static string $mapper_type = 'GoalMapper';
  
  protected int $time;
  protected int $project_id;
}
