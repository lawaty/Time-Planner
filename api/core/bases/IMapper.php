<?php

interface IMapper
{
  public static function create(array $model_data): ?IEntity; // Creates a new record and returns the corresponding model instance
  public function save(): bool; // success flag
  public static function get(array $keys); // Load record info into domain object
  public static function getAll(array $keys): Entities; // Array of domain objects
  public function delete(): bool; // Success Flag
}
