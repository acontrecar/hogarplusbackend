export function mapDtoToEntity<T extends object>(
  entity: T,
  dto: Partial<T>,
  excludedFields: (keyof T)[] = [],
): T {
  for (const key in dto) {
    if (dto[key] !== undefined && !excludedFields.includes(key as keyof T)) {
      if (key in entity) {
        (entity[key as keyof T] as any) = dto[key];
      }
    }
  }
  return entity;
}
