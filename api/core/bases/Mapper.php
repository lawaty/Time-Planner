<?php

/**
 * @property string $table
 * @property array $record_info
 * @property string $entity_type
 */
abstract class Mapper implements IMapper
{
  protected IEntity $entity; // entity instance

  public static function getTableName(): string
  {
    return static::$table;
  }

  public static function sanitize(array $data): array
  {
    /**
     * Function makes the data ready for insertion
     */
    $healthy = [];
    foreach(static::$record_info as $property){
      if(!isset($data[$property]))
        continue;

      if (is_array($data[$property]))
        $healthy[$property] = json_encode($data[$property]);

      else $healthy[$property] = $data[$property];
    }
      
    return $healthy;
  }

  public function __construct(IEntity $entity)
  {
    $this->entity = $entity;
  }

  public static function create(array $entity_data): ?IEntity
  {
    /**
     * Method creates new record and returns a complete entity instance
     * @param array $entity_data
     * @return IModel: domain object instance
     */

    $record = static::sanitize($entity_data);

    $id = DB::getDB()->insert(static::$table, $record);
    if($id){
      $entity = new static::$entity_type($id);
      $entity->load($entity_data);
      return $entity;
    }

    return null;
  }

  public function save(): bool
  {
    /**
     * Method updates instance record if exists and creates it otherwise
     * @return bool: flag for success
     */
    $db = DB::getDB();

    if(!$id = $this->entity->getID())
      throw new IncompleteEntity(static::$entity_type);

    $info = [];
    foreach(static::$record_info as $info)
      $info[$info] = $this->entity->get($info);

    if($result = $db->update(static::$table, $info, $id))
      $this->entity->setSync(true);

    return (bool) $result;
  }

  public static function get(array $filters = []): ?IEntity
  {
    /**
     * Method loads record info into a entity instance
     * @param array $filters: db search filters
     * @return ?IModel: domain object instance if found
     * this method returns the first found object if many records matched
     */
    static::validateFilters($filters);

    if ($items = DB::getDB()->select('*', static::$table, $filters)) {
      $entity = new static::$entity_type($items[0]['id']);
      $entity->load($items[0]);
      $entity->setSync(true);
      return $entity;
    }
    return null;
  }

  public static function getAll(array $filters = []): Entities
  {
    /**
     * Method loads records' info into entity instances
     * @param array $filters: db search filters
     * @return array: matched records
     */
    static::validateFilters($filters);

    if (is_array($filters) && !count($filters))
      $filters = [];

    return new Entities(DB::getDB()->select('*', static::$table, $filters), static::$entity_type);
  }

  public static function validateFilters(array $filters)
  {
    foreach($filters as $key => $value)
      if(!in_array($key, static::$record_info) && !is_numeric($key) && $key != 'id')
        throw new InvalidArguments("Invalid Filter Key $key for entity of type ".static::$entity_type);
  }

  public function delete(): bool
  {
    /**
     * Methods deletes the record corresponding to the current entity instance
     * @return bool: success flag
     */
    $result = DB::getDB()->delete(static::$table, $this->entity->getID());
    if ($result)
      unset($this->entity);

    return (bool) $result;
  }
}
