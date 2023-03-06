<?php

class Project extends Entity {
  protected static string $mapper_type = "ProjectMapper";

  protected string $name;
  protected string $color;
  protected int $user_id;

  public function getMapper(): ProjectMapper
  {
    return parent::getMapper();
  }
}