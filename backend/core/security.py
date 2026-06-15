import secrets


def verify_password(password: str, stored_password: str) -> bool:
    if stored_password.startswith(("$2a$", "$2b$", "$2y$")):
        try:
            import bcrypt
        except ImportError:
            return False

        return bcrypt.checkpw(
            password.encode("utf-8"),
            stored_password.encode("utf-8"),
        )

    return secrets.compare_digest(stored_password, password)
