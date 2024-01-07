import crypto from 'crypto';

const generatePath = () => {
  // Generate a random alphanumeric string
  const randomChars = Math.random() // Math.random() returns a random number between 0 and 1
    .toString(36) // Convert the random number to a base-36 string (numbers + letters), e.g. 0.123 -> "0.4fzyo82mvyr"
    .substring(2, 6); // Take the first 4 characters, e.g. "0.4fzyo82mvyr" -> "4fzy"

  // Get the current timestamp
  const timestamp = Date.now().toString();

  // Hash the random string and timestamp to ensure uniqueness and security
  const hash = crypto.createHash('sha256');
  hash.update(randomChars + timestamp);
  const hashedValue = hash.digest('hex').substring(0, 6); // Take the first 6 characters for brevity

  // Concatenate all components to form the final binId
  return `${randomChars}-${hashedValue}`;
}

export default generatePath;