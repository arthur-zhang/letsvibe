use rand::prelude::IndexedRandom;
use std::collections::HashSet;

pub const PLACE_NAMES: [&str; 50] = [
    "andorra",
    "barcelona",
    "cairo",
    "dublin",
    "edinburgh",
    "florence",
    "geneva",
    "helsinki",
    "istanbul",
    "jakarta",
    "kyoto",
    "lisbon",
    "madrid",
    "nairobi",
    "oslo",
    "paris",
    "quebec",
    "rome",
    "seattle",
    "tokyo",
    "utrecht",
    "venice",
    "warsaw",
    "xiamen",
    "yokohama",
    "zurich",
    "amsterdam",
    "berlin",
    "copenhagen",
    "denver",
    "essex",
    "frankfurt",
    "glasgow",
    "houston",
    "innsbruck",
    "jersey",
    "kingston",
    "lima",
    "melbourne",
    "naples",
    "oxford",
    "portland",
    "queens",
    "reno",
    "stockholm",
    "toronto",
    "urbana",
    "vancouver",
    "wellington",
    "york",
];

/// Select a random unused place name from the list
/// Returns None if all names are used
pub fn select_available_name(used_names: &[String]) -> Option<String> {
    let used_set: HashSet<&str> = used_names.iter().map(|s| s.as_str()).collect();

    let available: Vec<&str> = PLACE_NAMES
        .iter()
        .copied()
        .filter(|name| !used_set.contains(*name))
        .collect();

    if available.is_empty() {
        return None;
    }

    let mut rng = rand::rng();
    available.choose(&mut rng).map(|s| s.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_select_available_name_empty_used() {
        let used: Vec<String> = vec![];
        let result = select_available_name(&used);
        assert!(result.is_some());
        assert!(PLACE_NAMES.contains(&result.unwrap().as_str()));
    }

    #[test]
    fn test_select_available_name_some_used() {
        let used = vec!["andorra".to_string(), "barcelona".to_string()];
        let result = select_available_name(&used);
        assert!(result.is_some());
        let name = result.unwrap();
        assert!(PLACE_NAMES.contains(&name.as_str()));
        assert_ne!(name, "andorra");
        assert_ne!(name, "barcelona");
    }

    #[test]
    fn test_select_available_name_all_used() {
        let used: Vec<String> = PLACE_NAMES.iter().map(|s| s.to_string()).collect();
        let result = select_available_name(&used);
        assert!(result.is_none());
    }
}
