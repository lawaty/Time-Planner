<?php

class Session extends Entity
{
  protected static string $mapper_type = "SessionMapper";

  protected ?string $description;
  protected string $date;
  protected string $time;
  protected int $project_id;
}
